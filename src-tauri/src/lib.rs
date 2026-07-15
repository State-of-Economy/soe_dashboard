mod oauth;
mod token_store;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .invoke_handler(tauri::generate_handler![
            oauth::get_redirect_uri,
            oauth::wait_for_oauth_callback,
            token_store::store_token,
            token_store::get_token,
            token_store::clear_token,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
