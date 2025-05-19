
package net.sampsoftware.genai.controller;

import lombok.RequiredArgsConstructor;
import net.sampsoftware.genai.dto.CytoscapeDto;
import net.sampsoftware.genai.service.CytoscapeService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/cytoscape")
@RequiredArgsConstructor
public class CytoscapeController {

    private final CytoscapeService cytoscapeService;

    @GetMapping("/books-summaries")
    public CytoscapeDto getBooksSummariesGraph() {
        return cytoscapeService.getBooksSummariesGraph();
    }
}
