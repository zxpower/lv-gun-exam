#!/bin/sh

if [ -n "$VITE_GA_MEASUREMENT_ID" ]; then
    echo "Injecting Google Analytics ID: $VITE_GA_MEASUREMENT_ID"
    GA_SCRIPT="<!-- Google tag (gtag.js) -->
<script async src=\"https://www.googletagmanager.com/gtag/js?id=$VITE_GA_MEASUREMENT_ID\"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '$VITE_GA_MEASUREMENT_ID');
</script>"
    find /usr/share/nginx/html -name "index.html" -exec sed -i "s|<!-- __GA_PLACEHOLDER__ -->|$GA_SCRIPT|g" {} +
else
    find /usr/share/nginx/html -name "index.html" -exec sed -i "s|<!-- __GA_PLACEHOLDER__ -->||g" {} +
fi

exec nginx -g "daemon off;"
