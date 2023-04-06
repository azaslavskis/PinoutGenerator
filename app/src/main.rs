
mod server;
use crate::server::call;



fn main() -> wry::Result<()> {
    use wry::{
      application::{
        event::{Event, StartCause, WindowEvent},
        event_loop::{ControlFlow, EventLoop},
        window::WindowBuilder,
      },
      webview::WebViewBuilder,
    };

    std::thread::spawn(move || {
    
        call();
    });
  
    let event_loop = EventLoop::new();
    let window = WindowBuilder::new()
      .with_title("PinOutApp")
      .build(&event_loop)?;
    let _webview = WebViewBuilder::new(window)?
      .with_url("http://127.0.0.1:8080/")?
      .build()?;
  
    event_loop.run(move |event, _, control_flow| {
      *control_flow = ControlFlow::Wait;
  
      match event {
        Event::NewEvents(StartCause::Init) => println!("Wry has started!"),
        Event::WindowEvent {
          event: WindowEvent::CloseRequested,
          ..
        } => *control_flow = ControlFlow::Exit,
        _ => (),
      }
    });
  }