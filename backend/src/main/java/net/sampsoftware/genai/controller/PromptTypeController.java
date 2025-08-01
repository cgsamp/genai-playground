package net.sampsoftware.genai.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.sampsoftware.genai.dto.PromptTypeDto;
import net.sampsoftware.genai.service.PromptService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/prompt-types")
@RequiredArgsConstructor
@Slf4j
public class PromptTypeController {

    private final PromptService promptService;

    /**
     * Get all prompt types
     */
    @GetMapping
    public ResponseEntity<List<PromptTypeDto>> getAllPromptTypes() {
        log.debug("GET /api/prompt-types - fetching all prompt types");
        List<PromptTypeDto> types = promptService.getAllPromptTypes();
        return ResponseEntity.ok(types);
    }
}