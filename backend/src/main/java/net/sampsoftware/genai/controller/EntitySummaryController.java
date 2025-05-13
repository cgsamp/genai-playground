// Controller
package net.sampsoftware.genai.controller;

import net.sampsoftware.genai.dto.EntitySummaryDto;
import net.sampsoftware.genai.service.EntitySummaryService;

import org.springframework.web.bind.annotation.*;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.List;

@Slf4j
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
        List<String> types = entitySummaryService.findAllTypes();
        log.debug("Found types in database: {}", types);

        log.debug("Type, ID: {}, {}", entity, entityIds);
        List<EntitySummaryDto> summaries = entitySummaryService.findByTypeAndIds(entity, entityIds);
        log.debug("entitySummaries returned: {}", summaries.size());
        //log.trace("entitySummaries: {}", summaries);
        return summaries;
    }

    @GetMapping("/api/summaries/types")
    public List<String> getAllTypes() {
        List<String> types = entitySummaryService.findAllTypes();
        return types;
    }

}
