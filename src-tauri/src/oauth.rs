use tiny_http::{Response, Server};

// Fester Port, weil Discord redirect_uri exakt gegen eine im Developer Portal hinterlegte
// Whitelist prüft (kein zufälliger/ephemerer Port möglich). Muss im Discord-Portal unter
// OAuth2 -> Redirects als http://127.0.0.1:12345/callback eingetragen sein.
const CALLBACK_PORT: u16 = 12345;

#[tauri::command]
pub fn get_redirect_uri() -> String {
    format!("http://127.0.0.1:{}/callback", CALLBACK_PORT)
}

/// Startet einen lokalen Loopback-Server, wartet auf genau einen eingehenden Request (den
/// Discord-Redirect nach erfolgreichem Login im Systembrowser) und gibt den `code`-Query-Parameter
/// zurück. Der Austausch code -> access_token passiert NICHT hier, sondern serverseitig in
/// soe_supportdesk (Client Secret bleibt dort, nie im Desktop-Client).
#[tauri::command]
pub async fn wait_for_oauth_callback() -> Result<String, String> {
    let result = tauri::async_runtime::spawn_blocking(move || -> Result<String, String> {
        let server = Server::http(("127.0.0.1", CALLBACK_PORT))
            .map_err(|e| format!("Konnte lokalen Port {} nicht öffnen: {}", CALLBACK_PORT, e))?;

        let request = server.recv().map_err(|e| e.to_string())?;

        let full_url = format!("http://127.0.0.1{}", request.url());
        let parsed = url::Url::parse(&full_url).map_err(|e| e.to_string())?;

        let code = parsed
            .query_pairs()
            .find(|(k, _)| k == "code")
            .map(|(_, v)| v.into_owned());
        let error = parsed
            .query_pairs()
            .find(|(k, _)| k == "error")
            .map(|(_, v)| v.into_owned());

        let html = if code.is_some() {
            "<html><body style=\"font-family:sans-serif;text-align:center;margin-top:20vh\">\
             <h2>Login erfolgreich</h2><p>Du kannst dieses Fenster jetzt schliessen und zur App zurueckkehren.</p>\
             </body></html>"
        } else {
            "<html><body style=\"font-family:sans-serif;text-align:center;margin-top:20vh\">\
             <h2>Login fehlgeschlagen</h2><p>Bitte versuche es in der App erneut.</p>\
             </body></html>"
        };

        let header = tiny_http::Header::from_bytes(
            &b"Content-Type"[..],
            &b"text/html; charset=utf-8"[..],
        )
        .unwrap();
        let response = Response::from_string(html).with_header(header);
        let _ = request.respond(response);

        match (code, error) {
            (Some(c), _) => Ok(c),
            (None, Some(e)) => Err(format!("Discord hat den Login abgelehnt: {}", e)),
            (None, None) => Err("Kein 'code'-Parameter im Callback erhalten".to_string()),
        }
    })
    .await
    .map_err(|e| e.to_string())?;

    result
}
