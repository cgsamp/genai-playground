package net.sampsoftware.genai.controller;

import lombok.RequiredArgsConstructor;
import net.sampsoftware.genai.dto.BatchSummaryRequest;
import net.sampsoftware.genai.service.AsyncBookSummaryService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/batch-summary")
@RequiredArgsConstructor
public class BatchSummaryController {

    private final AsyncBookSummaryService aiService;

    @PostMapping
    public ResponseEntity<?> generateSummaries(@RequestBody BatchSummaryRequest request) {
        return ResponseEntity.ok(aiService.generateResponse(request.prompt(), request.modelConfigurationId()));

    }

    // Error response DTO
    record ErrorResponse(String error, String message) {}


}