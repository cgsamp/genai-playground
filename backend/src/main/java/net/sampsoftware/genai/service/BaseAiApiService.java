package net.sampsoftware.genai.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor

public class BaseAiApiService {

   @FunctionalInterface
    protected interface AICallFunction {
        String call() throws Exception;
    }

    protected String executeApiCall(AICallFunction apiCall) {
        try {
            return apiCall.call();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

}

