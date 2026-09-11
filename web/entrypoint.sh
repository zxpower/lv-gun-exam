#!/bin/sh

if [ -n "$VITE_GA_MEASUREMENT_ID" ]; then
    echo "Injecting Google Analytics ID: $VITE_GA_MEASUREMENT_ID"
    # Write snippet to a temp file to avoid sed delimiter/escaping issues
    cat <<EOF > /tmp/ga.html
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=$VITE_GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '$VITE_GA_MEASUREMENT_ID');
</script>
EOF
    # Replace placeholder with file contents using awk or python/sed alternative
    for f in $(find /usr/share/nginx/html -name "index.html"); do
        awk '
            /<!-- __GA_PLACEHOLDER__ -->/ {
                while ((getline line < "/tmp/ga.html") > 0) print line;
                close("/tmp/ga.html");
                next
            }
            {print}
        ' "$f" > "$f.tmp" && mv "$f.tmp" "$f"
    done
else
    find /usr/share/nginx/html -name "index.html" -exec sed -i 's/<!-- __GA_PLACEHOLDER__ -->//g' {} +
fi

exec nginx -g "daemon off;"
