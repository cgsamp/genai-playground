// Controller
package net.sampsoftware.genai.controller;

import net.sampsoftware.genai.dto.SummaryDto;
import net.sampsoftware.genai.repository.EntitySummaryRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/summaries")
public class EntitySummaryController {

    private final EntitySummaryRepository summaryRepo;

    public EntitySummaryController(EntitySummaryRepository summaryRepo) {
        this.summaryRepo = summaryRepo;
    }

    @GetMapping
    public List<SummaryDto> getSummaries(
        @RequestParam String entity,
        @RequestParam List<Long> entityIds
    ) {
        return summaryRepo.findSummariesByEntityAndIds(entity, entityIds);
    }
}
