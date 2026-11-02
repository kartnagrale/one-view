package com.neml.agrianalytix;

import com.neml.agrianalytix.config.AgriAnalytixProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication(
        exclude = DataSourceAutoConfiguration.class
)
@EnableScheduling
@EnableConfigurationProperties(AgriAnalytixProperties.class)
public class AgriAnalytixApplication {

    public static void main(String[] args) {
        SpringApplication.run(AgriAnalytixApplication.class, args);
    }
}
