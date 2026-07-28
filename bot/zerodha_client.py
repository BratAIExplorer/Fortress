import logging
import urllib.parse as urlparse
from kiteconnect import KiteConnect

logger = logging.getLogger("ZerodhaClient")

def parse_request_token(text):
    """
    Parses a Zerodha request token from either a raw text input
    or a full redirected URL.
    """
    text = text.strip()
    if "request_token=" in text:
        try:
            parsed = urlparse.urlparse(text)
            params = urlparse.parse_qs(parsed.query)
            if "request_token" in params:
                token = params["request_token"][0]
                logger.info(f"Successfully parsed request_token from URL: {token}")
                return token
        except Exception as e:
            logger.error(f"Failed to parse request token from URL text: {e}")
    return text

class ZerodhaClient:
    def __init__(self, api_key, api_secret, client_id):
        self.api_key = api_key
        self.api_secret = api_secret
        self.client_id = client_id
        self.kite = None
        self.logged_in = False

    def initialize_client(self):
        """Creates a fresh instance of KiteConnect."""
        try:
            self.kite = KiteConnect(api_key=self.api_key)
            return True
        except Exception as e:
            logger.error(f"Failed to initialize KiteConnect SDK: {e}")
            return False

    def get_login_url(self):
        """Generates the login URL for user authentication."""
        if not self.kite:
            self.initialize_client()
        try:
            return f"https://kite.zerodha.com/connect/login?api_key={self.api_key}&v=3"
        except Exception as e:
            logger.error(f"Error generating login URL: {e}")
            return None

    def verify_request_token_and_login(self, request_token):
        """Exchanges the request token for an access token to establish session."""
        if not self.kite:
            self.initialize_client()
            
        try:
            token = parse_request_token(request_token)
            logger.info("Generating Kite Connect session using request token...")
            session = self.kite.generate_session(token, api_secret=self.api_secret)
            access_token = session.get("access_token")
            
            if access_token:
                self.kite.set_access_token(access_token)
                self.logged_in = True
                logger.info("Successfully authenticated with Zerodha Kite Connect.")
                return access_token
            else:
                logger.error("access_token missing in generate_session response.")
        except Exception as e:
            logger.error(f"Exception during request token verification: {e}")
            
        return None

    def validate_session(self):
        """Checks if the current session token is valid."""
        if not self.kite or not getattr(self.kite, "access_token", None):
            self.logged_in = False
            return False
            
        try:
            logger.info("Validating cached Zerodha session token...")
            # Querying margins is a fast, read-only endpoint that confirms if the session is alive
            self.kite.margins()
            self.logged_in = True
            logger.info("Session token is valid.")
            return True
        except Exception as e:
            logger.warning(f"Session validation failed: {e}")
            
        self.logged_in = False
        return False

    def place_order(self, symbol, exchange, qty, side):
        """Places a market Buy or Sell order for Delivery (CNC)."""
        if not self.logged_in or not self.kite:
            return False, "Zerodha client is not logged in."
            
        try:
            # Clean symbol: Zerodha symbols on NSE do not have "-EQ" suffix.
            # e.g., "BIOCON-EQ" should be passed to Zerodha as "BIOCON".
            clean_symbol = symbol.strip().upper()
            if clean_symbol.endswith("-EQ"):
                clean_symbol = clean_symbol[:-3]
                
            logger.info(f"Placing {side} order for {qty} shares of {clean_symbol} on {exchange}...")
            
            order_id = self.kite.place_order(
                variety=self.kite.VARIETY_REGULAR,
                exchange=self.kite.EXCHANGE_NSE if exchange.upper() == "NSE" else exchange,
                tradingsymbol=clean_symbol,
                transaction_type=self.kite.TRANSACTION_TYPE_BUY if side.upper() == "BUY" else self.kite.TRANSACTION_TYPE_SELL,
                quantity=qty,
                product=self.kite.PRODUCT_CNC,
                order_type=self.kite.ORDER_TYPE_MARKET,
                market_protection=1.0
            )
            
            logger.info(f"Order placed successfully. Order ID: {order_id}")
            return True, f"Success: Order ID {order_id}"
        except Exception as e:
            logger.error(f"Exception during Zerodha order placement: {e}")
            return False, str(e)
