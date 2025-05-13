package net.sampsoftware.genai;

import org.springframework.boot.WebApplicationType;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@EnableAsync
public class GenaiApplication {
    public static void main(String[] args) {
        new SpringApplicationBuilder(GenaiApplication.class)
            .web(WebApplicationType.SERVLET) // 🔒 Explicitly use Servlet mode
            .run(args);
    }
}
