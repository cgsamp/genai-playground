// Controller
package net.sampsoftware.genai.controller;

import net.sampsoftware.genai.dto.EntitySummaryDto;
import net.sampsoftware.genai.service.EntitySummaryService;

import org.springframework.web.bind.annotation.*;

import lombok.RequiredArgsConstructor;

import java.util.List;

@RestController
@RequestMapping("/api/summaries")
@RequiredArgsConstructor
public class EntitySummaryController {

    private final EntitySummaryService entitySummaryService;

    @GetMapping
    public List<EntitySummaryDto> getSummaries(
        @RequestParam String entity,
        @RequestParam List<Long> entityIds
    ) {
        return entitySummaryService.findByTypeAndIds(entity, entityIds);
    }
}
