#!/bin/sh
# Gera env.js a partir das variáveis do container, permitindo trocar a URL da API sem rebuild
set -e
escaped=$(printf '%s' "${VITE_API_URL:-}" | sed -e 's/\\/\\\\/g' -e 's/"/\\"/g')
printf 'window.__ENV__ = { VITE_API_URL: "%s" }\n' "$escaped" > /usr/share/nginx/html/env.js
