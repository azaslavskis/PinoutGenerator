use std::borrow::BorrowMut;
use std::{fs, borrow::Borrow};
use std::io::Write;
use walkdir::{DirEntry, WalkDir};
use regex::Regex;



fn read_content(path:String) -> String {
    let path = path.to_owned();
    match fs::read_to_string(path) {
        Ok(content) => {
           return content;
        }
        Err(err) => {
            return "error".to_owned();
        }
    }
}

fn add_min_js_to_html(path:String,string_replace:String) {
    let html=read_content("./web/index.html".to_owned());
let functions=format!("<script>{}</script>",read_content(path).replace("\n", ""));
let result=html.replace(&string_replace, functions.as_str());
fs::write("./web/index.html", result).expect("Unable to write file");
}
fn add_min_css_to_html(path:String,string_replace:String) {
    let html=read_content("./web/index.html".to_owned());
let functions=format!("<style>{}</style>",read_content(path).replace("\n", ""));
let result=html.replace(&string_replace, functions.as_str());
fs::write("./src/to_show.html", result).expect("Unable to write file");
}
pub fn call_me()->String {
    add_min_js_to_html("./web/functions.js".to_string(),r#"<script src="functions.js"></script>"#.to_owned());
    add_min_js_to_html("./web/save.js".to_string(),r#"<script src="save.js"></script>"#.to_owned());
    add_min_js_to_html("./web/table.js".to_string(),r#"<script src="table.js"></script>"#.to_owned());
    add_min_js_to_html("./web/html2canvas.min.js".to_string(),r#"<script src="html2canvas.min.js"></script>"#.to_owned());
    add_min_js_to_html("./web/html2canvas.min.js".to_string(),r#"<script src="html2canvas.min.js"></script>"#.to_owned());
    add_min_css_to_html("./web/styles.css".to_string(),r#"<link rel="stylesheet" href="styles.css">"#.to_owned());
    return read_content("./src/to_show.html".to_owned());

}

fn main() {
    call_me();
}