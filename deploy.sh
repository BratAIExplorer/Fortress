#!/bin/bash
# VPS Deployment Script
# Purpose: Deploy new code, validate configuration, restart services
# Called by: GitHub Actions CI/CD pipeline or manual deployment
# Usage: ./deploy.sh [COMMIT_SHA] [APP_PORT]

set -e

# Configuration
APP_DIR="/opt/fortress"
APP_NAME="fortress-app"
CONFIG_FILE="$APP_DIR/$APP_NAME/.env.production"
NGINX_CONFIG="/etc/nginx/sites-enabled/fortress"

# Validate inputs
if [ $# -lt 2 ]; then
    echo "Usage: $0 <COMMIT_SHA> <APP_PORT>"
    echo "Example: $0 abc123def456 3000"
    exit 1
fi

COMMIT_SHA=$1
APP_PORT=$2

# Helper functions
log_section() {
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "$1"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
}

log_success() {
    echo "✅ $1"
}

log_error() {
    echo "❌ $1"
}

log_warning() {
    echo "⚠️  $1"
}

# Validation functions
validate_port() {
    if ! [[ "$1" =~ ^[0-9]+$ ]] || [ "$1" -lt 1024 ] || [ "$1" -gt 65535 ]; then
        log_error "Invalid port: $1 (must be 1024-65535)"
        exit 1
    fi
}

validate_commit() {
    if ! [[ "$1" =~ ^[a-f0-9]+$ ]] || [ ${#1} -lt 7 ]; then
        log_error "Invalid commit SHA: $1 (must be at least 7 hex characters)"
        exit 1
    fi
}

check_port_in_env() {
    if [ ! -f "$CONFIG_FILE" ]; then
        log_error "Config file not found: $CONFIG_FILE"
        exit 1
    fi

    ENV_PORT=$(grep "^PORT=" "$CONFIG_FILE" | cut -d= -f2)

    if [ -z "$ENV_PORT" ]; then
        log_error "PORT not found in $CONFIG_FILE"
        exit 1
    fi

    if [ "$ENV_PORT" != "$APP_PORT" ]; then
        log_error "PORT mismatch!"
        log_error "  .env.production contains: PORT=$ENV_PORT"
        log_error "  Deployment specifies: PORT=$APP_PORT"
        log_error "UPDATE .env.production BEFORE DEPLOYING!"
        exit 1
    fi

    log_success "Port validation: .env.production ($ENV_PORT) matches deployment ($APP_PORT)"
}

check_nginx_config() {
    # Verify proxy_pass matches
    NGINX_PORT=$(grep "proxy_pass http://127.0.0.1:" "$NGINX_CONFIG" | \
        grep -oP ':\K[0-9]+' | head -1)

    if [ -z "$NGINX_PORT" ]; then
        log_error "proxy_pass not found in $NGINX_CONFIG"
        exit 1
    fi

    if [ "$NGINX_PORT" != "$APP_PORT" ]; then
        log_warning "Nginx proxy_pass port ($NGINX_PORT) doesn't match deployment port ($APP_PORT)"
        log_section "Updating Nginx configuration..."

        # Backup original
        cp "$NGINX_CONFIG" "$NGINX_CONFIG.backup.$(date +%s)"
        log_success "Backed up Nginx config to $NGINX_CONFIG.backup.*"

        # Update port
        sed -i "s/proxy_pass http:\/\/127.0.0.1:[0-9]*/proxy_pass http:\/\/127.0.0.1:$APP_PORT/g" "$NGINX_CONFIG"

        NGINX_PORT=$(grep "proxy_pass http://127.0.0.1:" "$NGINX_CONFIG" | \
            grep -oP ':\K[0-9]+' | head -1)

        log_success "Updated Nginx proxy_pass to port $NGINX_PORT"
    else
        log_success "Nginx proxy_pass port ($NGINX_PORT) matches deployment port ($APP_PORT)"
    fi

    # Validate syntax
    if ! nginx -t 2>&1 | grep -q "successful"; then
        log_error "Nginx configuration syntax error!"
        if [ -f "$NGINX_CONFIG.backup.$(date +%s)" ]; then
            log_warning "Restoring backup..."
            cp "$NGINX_CONFIG.backup."* "$NGINX_CONFIG"
        fi
        exit 1
    fi

    log_success "Nginx configuration is valid"
}

check_app_running() {
    if ! command -v pm2 &> /dev/null; then
        log_error "PM2 not installed"
        exit 1
    fi

    if ! pm2 list | grep -q "$APP_NAME"; then
        log_warning "PM2 process '$APP_NAME' not found, will start it"
        return 1
    fi

    return 0
}

health_check() {
    local max_attempts=10
    local attempt=0
    local port=$1

    log_section "Running health checks..."

    while [ $attempt -lt $max_attempts ]; do
        STATUS=$(curl -s -o /dev/null -w '%{http_code}' "http://127.0.0.1:$port/_health" 2>/dev/null || echo "000")

        if [ "$STATUS" == "200" ]; then
            log_success "Health check passed (HTTP 200)"
            return 0
        fi

        attempt=$((attempt + 1))
        if [ $attempt -lt $max_attempts ]; then
            log_warning "Attempt $attempt/$max_attempts: HTTP $STATUS, retrying in 5s..."
            sleep 5
        fi
    done

    log_error "Health check failed after $max_attempts attempts (last: HTTP $STATUS)"
    return 1
}

# Main deployment flow
main() {
    log_section "🚀 Starting Fortress Deployment"
    echo "Commit: $COMMIT_SHA"
    echo "App Port: $APP_PORT"
    echo "App Dir: $APP_DIR"

    # Validate inputs
    validate_commit "$COMMIT_SHA"
    validate_port "$APP_PORT"

    # Step 1: Git operations
    log_section "STEP 1: Git operations"
    cd "$APP_DIR/$APP_NAME"

    if ! git fetch origin main; then
        log_error "Failed to fetch from origin"
        exit 1
    fi
    log_success "Fetched latest code"

    if ! git reset --hard "$COMMIT_SHA"; then
        log_error "Failed to checkout commit $COMMIT_SHA"
        exit 1
    fi
    log_success "Checked out commit $COMMIT_SHA"

    # Step 2: Configuration validation
    log_section "STEP 2: Configuration validation"
    check_port_in_env
    check_nginx_config

    # Step 3: Start/restart services
    log_section "STEP 3: Starting services"

    # Save current logs for reference
    pm2 logs "$APP_NAME" --err --lines 50 > "/tmp/pm2_logs_before_restart.txt" 2>/dev/null || true
    log_success "Saved pre-restart logs"

    # Restart or start PM2 process
    if check_app_running; then
        log_warning "Restarting PM2 process '$APP_NAME'..."
        pm2 restart "$APP_NAME" --silent
    else
        log_warning "Starting PM2 process from ecosystem.config.js..."
        pm2 start ecosystem.config.js --silent
    fi

    sleep 3

    if ! pm2 list | grep -q "$APP_NAME"; then
        log_error "Failed to start PM2 process"
        exit 1
    fi

    log_success "PM2 process started/restarted"

    # Reload Nginx
    log_warning "Reloading Nginx..."
    if ! systemctl reload nginx; then
        log_error "Failed to reload Nginx"
        exit 1
    fi
    log_success "Nginx reloaded"

    # Step 4: Health checks
    if ! health_check "$APP_PORT"; then
        log_error "Health check failed, rolling back..."
        log_section "Rolling back..."

        git reset --hard HEAD~1
        pm2 restart "$APP_NAME" --silent
        systemctl reload nginx

        log_warning "Rollback complete"
        exit 1
    fi

    # Step 5: Verify specific endpoints
    log_section "STEP 4: Verifying API endpoints"

    # Check API response
    API_RESPONSE=$(curl -s "http://127.0.0.1:$APP_PORT/api/scan/results?market=NSE" | jq '.scanId' 2>/dev/null || echo "null")

    if [ "$API_RESPONSE" != "null" ] && [ ! -z "$API_RESPONSE" ]; then
        log_success "API returning data"
    else
        log_warning "API endpoint not returning expected data (may be normal if scans haven't run)"
    fi

    # Success summary
    log_section "✅ Deployment completed successfully!"
    echo ""
    echo "App Status:"
    pm2 list | grep "$APP_NAME" || true
    echo ""
    echo "Listening on:"
    lsof -i ":$APP_PORT" | tail -1 || echo "  (port status check)"
    echo ""
    echo "Access:"
    echo "  Local: http://127.0.0.1:$APP_PORT"
    echo "  Public: https://fortressintelligence.space"
    echo ""
    echo "Next steps:"
    echo "  1. Monitor logs: pm2 logs $APP_NAME"
    echo "  2. Check Nginx: tail -f /var/log/nginx/error.log"
    echo "  3. Verify database: curl -s https://fortressintelligence.space/api/scan/results?market=NSE | jq '.results | length'"
}

# Handle errors
trap 'log_error "Deployment script failed"; exit 1' ERR

# Run main
main
