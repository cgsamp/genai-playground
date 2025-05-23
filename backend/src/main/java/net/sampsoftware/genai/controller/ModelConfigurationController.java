package net.sampsoftware.genai.controller;

import lombok.RequiredArgsConstructor;
import net.sampsoftware.genai.dto.ModelConfigurationDto;
import net.sampsoftware.genai.mapper.ModelConfigurationMapper;
import net.sampsoftware.genai.model.ModelConfiguration;
import net.sampsoftware.genai.repository.ModelConfigurationRepository;

import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/model-configurations")
@RequiredArgsConstructor
public class ModelConfigurationController extends CrudDtoController<ModelConfiguration, ModelConfigurationDto, Long> {

    private final ModelConfigurationRepository configRepository;
    private final ModelConfigurationMapper configMapper;

    @Override
    protected JpaRepository<ModelConfiguration, Long> getRepository() {
        return configRepository;
    }

    @Override
    protected ModelConfigurationDto toDto(ModelConfiguration entity) {
        return configMapper.toDto(entity);
    }

    @Override
    protected ModelConfiguration toEntity(ModelConfigurationDto dto) {
        return configMapper.toEntity(dto);
    }

    @Override
    @GetMapping("/{id}")
    public ResponseEntity<ModelConfigurationDto> get(@PathVariable Long id) {
        var config = configRepository.findByIdWithModel(id);
        return config
            .map(configMapper::toDto)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @Override
    @GetMapping
    public List<ModelConfigurationDto> list() {
        var entities = ((ModelConfigurationRepository)getRepository()).findAllWithModels();
        
        var dtos = entities.stream()
                    .map(this::toDto)
                    .collect(Collectors.toList());
        
        return dtos;
    }
}
