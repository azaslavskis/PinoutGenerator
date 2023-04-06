#!/bin/bash

# Set the path to the docs lib directory
DOCS_LIB_PATH=./web-app

# Set the path to the output directory
OUTPUT_PATH=./app/web

# Find all the JS and CSS files in the docs lib directory and minify them
find $DOCS_LIB_PATH -name '*.js'  | while read file; do
    # Use terser to minify the file
    minified=$(terser "$file")
    # Get the filename without the path
    filename=$(basename "$file")
    # Create the output directory if it doesn't exist
    mkdir -p $OUTPUT_PATH
    # Write the minified file to the output directory
    echo "$minified" > "$OUTPUT_PATH/$filename"
done

cp ./web-app/index.html ./app/web/index.html


# Set the path to the CSS directory
CSS_DIR=./web-app
# Set the output directory for the minified files
OUTPUT_DIR=./app/web



# Minify each CSS file in the directory
for file in $CSS_DIR/*.css; do
    # Get the filename without the path
    filename=$(basename "$file")
    # Minify the CSS file using UglifyCSS
    uglified=$(uglifycss "$file")
    # Write the minified CSS to a file in the output directory
    echo "$uglified" > "$OUTPUT_DIR/$filename"
done
cd app

cargo build --release 

cargo build --target x86_64-pc-windows-gnu --release
