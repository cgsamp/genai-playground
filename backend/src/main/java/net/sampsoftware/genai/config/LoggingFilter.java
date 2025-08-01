package net.sampsoftware.genai.config;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.UUID;

@Component
@Slf4j
public class LoggingFilter implements Filter {

    private static final String REQUEST_ID_HEADER = "X-Request-ID";
    private static final String REQUEST_ID_MDC_KEY = "requestId";

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;
        
        // Generate or extract request ID
        String requestId = httpRequest.getHeader(REQUEST_ID_HEADER);
        if (requestId == null || requestId.trim().isEmpty()) {
            requestId = UUID.randomUUID().toString().substring(0, 8);
        }
        
        // Add to MDC for logging context
        MDC.put(REQUEST_ID_MDC_KEY, requestId);
        
        // Add to response headers
        httpResponse.setHeader(REQUEST_ID_HEADER, requestId);
        
        long startTime = System.currentTimeMillis();
        
        try {
            log.info("Starting request: {} {} from {}", 
                    httpRequest.getMethod(), 
                    httpRequest.getRequestURI(), 
                    httpRequest.getRemoteAddr());
            
            chain.doFilter(request, response);
            
            long duration = System.currentTimeMillis() - startTime;
            log.info("Completed request: {} {} - Status: {} - Duration: {}ms", 
                    httpRequest.getMethod(), 
                    httpRequest.getRequestURI(), 
                    httpResponse.getStatus(), 
                    duration);
                    
        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startTime;
            log.error("Request failed: {} {} - Duration: {}ms - Error: {}", 
                    httpRequest.getMethod(), 
                    httpRequest.getRequestURI(), 
                    duration, 
                    e.getMessage(), e);
            throw e;
        } finally {
            // Clean up MDC
            MDC.remove(REQUEST_ID_MDC_KEY);
        }
    }
}