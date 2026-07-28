import logging
from tradingapi_b.mconnect import MConnectB

logger = logging.getLogger("MStockClient")

class MStockClient:
    def __init__(self, api_key, api_secret, client_code, password):
        self.api_key = api_key
        self.api_secret = api_secret
        self.client_code = client_code
        self.password = password
        self.mconnect = None
        self.logged_in = False
        self.request_token = None

    def initialize_client(self):
        """Creates a fresh instance of MConnectB."""
        try:
            self.mconnect = MConnectB()
            self.mconnect.set_api_key(self.api_key)
            return True
        except Exception as e:
            logger.error(f"Failed to initialize MConnectB SDK: {e}")
            return False

    def request_otp(self):
        """
        Triggers an OTP for user login.
        Returns the request token if successful, otherwise None.
        """
        if not self.mconnect:
            self.initialize_client()
            
        try:
            logger.info("Calling login endpoint to trigger OTP...")
            login_response = self.mconnect.login(self.client_code, self.password)
            
            if login_response.status_code == 200:
                resp_json = login_response.json()
                if resp_json.get("status") is True:
                    data = resp_json.get("data", {})
                    self.request_token = data.get("refreshToken") or data.get("jwtToken")
                    logger.info("OTP trigger successful.")
                    return self.request_token
                else:
                    logger.error(f"Login returned error: {resp_json.get('message')}")
            else:
                logger.error(f"Login call failed with HTTP {login_response.status_code}: {login_response.text}")
        except Exception as e:
            logger.error(f"Exception during OTP request: {e}")
            
        return None

    def verify_otp_and_login(self, otp):
        """Verifies the OTP to establish the active session."""
        if not self.mconnect or not self.request_token:
            logger.error("MConnect client not initialized or no request token available.")
            return False
            
        try:
            logger.info("Verifying OTP and generating session...")
            gen_session = self.mconnect.generate_session(self.api_key, self.request_token, otp)
            
            if gen_session.status_code == 200:
                resp_json = gen_session.json()
                if resp_json.get("status") is True:
                    data = resp_json.get("data", {})
                    jwt_token = data.get("jwtToken")
                    if jwt_token:
                        self.mconnect.set_access_token(jwt_token)
                        self.logged_in = True
                        logger.info("Successfully authenticated with mStock.")
                        return True
                    else:
                        logger.error("jwtToken missing in session generation response.")
                else:
                    logger.error(f"Session generation failed: {resp_json.get('message')}")
            else:
                logger.error(f"Session generation failed with HTTP {gen_session.status_code}: {gen_session.text}")
        except Exception as e:
            logger.error(f"Exception during OTP verification: {e}")
            
        return False

    def validate_session(self):
        """Checks if the current session token is valid."""
        if not self.mconnect or not getattr(self.mconnect, "access_token", None):
            self.logged_in = False
            return False
            
        try:
            logger.info("Validating cached mStock session token...")
            r = self.mconnect.get_fund_summary()
            if r.status_code == 200:
                resp_json = r.json()
                if resp_json.get("status") is True:
                    self.logged_in = True
                    logger.info("Session token is valid.")
                    return True
                else:
                    logger.warning(f"Session token invalid: {resp_json.get('message')}")
            else:
                logger.warning(f"Session validation failed with HTTP status: {r.status_code}")
        except Exception as e:
            logger.error(f"Exception during session validation: {e}")
            
        self.logged_in = False
        return False

    def place_order(self, symbol, exchange, qty, side):
        """Places a market Buy or Sell order for Delivery (CNC)."""
        if not self.logged_in or not self.mconnect:
            return False, "mStock client is not logged in."
            
        try:
            # Fetch the correct symbol token dynamically from Type A Quote API
            logger.info(f"Fetching symbol token for {symbol} on {exchange}...")
            token = ""
            exchange_token = f"{exchange.upper()}:{symbol.upper()}"
            
            url = "https://api.mstock.trade/openapi/typea/instruments/quote/ohlc"
            headers = {
                "Authorization": f"token {self.api_key}:{self.mconnect.access_token}",
                "X-Mirae-Version": "1"
            }
            params = {"i": exchange_token}
            
            try:
                import requests
                quote_response = requests.get(url, headers=headers, params=params, timeout=10)
                if quote_response.status_code == 200:
                    quote_json = quote_response.json()
                    if quote_json.get("status") == "success":
                        data = quote_json.get("data", {}).get(exchange_token, {})
                        fetched_token = data.get("instrumenttoken") or data.get("instrument_token") or data.get("token")
                        if fetched_token:
                            token = str(fetched_token)
                            logger.info(f"Successfully retrieved symbol token: {token}")
            except Exception as ex:
                logger.error(f"Error fetching dynamic symbol token: {ex}")
            
            if not token:
                logger.warning(f"Could not retrieve token for {symbol}. Attempting place_order with empty token...")
                
            logger.info(f"Placing {side} order for {qty} shares of {symbol} on {exchange} (Token: {token})...")
            response = self.mconnect.place_order(
                _variety="NORMAL",
                _tradingsymbol=symbol,
                _symboltoken=token,
                _exchange=exchange,
                _transactiontype=side,  # "BUY" or "SELL"
                _ordertype="MARKET",
                _quantity=str(qty),
                _producttype="DELIVERY",
                _price="0",
                _triggerprice="0",
                _squareoff="0",
                _stoploss="0",
                _trailingStopLoss="0",
                _disclosedquantity="0",
                _duration="DAY",
                _ordertag="macd_bot"
            )
            
            if response.status_code == 200:
                resp_data = response.json()
                
                # Unpack list response if returned as a list of dicts
                resp_json = {}
                if isinstance(resp_data, list) and len(resp_data) > 0:
                    resp_json = resp_data[0]
                elif isinstance(resp_data, dict):
                    resp_json = resp_data
                    
                if resp_json.get("status") is True or resp_json.get("status") == "true":
                    order_id = resp_json.get("data", {}).get("orderid") or resp_json.get("data", {}).get("orderNo")
                    logger.info(f"Order placed successfully. Order ID: {order_id}")
                    return True, f"Success: Order ID {order_id}"
                else:
                    err_msg = resp_json.get('message') or "Rejected by broker"
                    logger.error(f"Order placement rejected: {err_msg}")
                    return False, err_msg
            else:
                err_msg = f"HTTP {response.status_code}: {response.text}"
                try:
                    err_data = response.json()
                    err_json = {}
                    if isinstance(err_data, list) and len(err_data) > 0:
                        err_json = err_data[0]
                    elif isinstance(err_data, dict):
                        err_json = err_data
                        
                    if "message" in err_json:
                        err_msg = err_json["message"]
                except:
                    pass
                logger.error(f"Order API call failed: {err_msg}")
                return False, err_msg
        except Exception as e:
            logger.error(f"Exception during order placement: {e}")
            return False, str(e)
