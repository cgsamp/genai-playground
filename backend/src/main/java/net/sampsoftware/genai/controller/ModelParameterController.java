package net.sampsoftware.genai.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.sampsoftware.genai.dto.ModelParameterDto;
import net.sampsoftware.genai.service.ModelParameterService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/model-parameters")
@RequiredArgsConstructor

public class ModelParameterController {

    private final ModelParameterService parameterService;

    @GetMapping("/model/{modelId}")
    public List<ModelParameterDto> getParametersForModel(@PathVariable Long modelId) {
        List<ModelParameterDto> ret = parameterService.getParametersForModel(modelId);
        log.trace(Integer.toString(ret.size()));
        return ret;
    }
}
