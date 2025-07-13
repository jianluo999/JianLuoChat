package com.jianluochat.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "matrix")
public class MatrixConfig {
    
    private Homeserver homeserver = new Homeserver();
    private Client client = new Client();

    public static class Homeserver {
        private String url = "https://matrix.org";
        
        public String getUrl() { return url; }
        public void setUrl(String url) { this.url = url; }
    }

    public static class Client {
        private String userId;
        private String accessToken;
        private String deviceId = "JIANLUOCHAT_DEVICE";
        
        public String getUserId() { return userId; }
        public void setUserId(String userId) { this.userId = userId; }
        
        public String getAccessToken() { return accessToken; }
        public void setAccessToken(String accessToken) { this.accessToken = accessToken; }
        
        public String getDeviceId() { return deviceId; }
        public void setDeviceId(String deviceId) { this.deviceId = deviceId; }
    }

    public Homeserver getHomeserver() { return homeserver; }
    public void setHomeserver(Homeserver homeserver) { this.homeserver = homeserver; }

    public Client getClient() { return client; }
    public void setClient(Client client) { this.client = client; }
}
