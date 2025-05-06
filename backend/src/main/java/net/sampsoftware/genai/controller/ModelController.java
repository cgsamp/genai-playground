package net.sampsoftware.genai.controller;

import lombok.RequiredArgsConstructor;
import net.sampsoftware.genai.dto.ModelDto;
import net.sampsoftware.genai.mapper.ModelMapper;
import net.sampsoftware.genai.model.Model;
import net.sampsoftware.genai.repository.ModelRepository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/models")
@RequiredArgsConstructor
public class ModelController extends CrudDtoController<Model, ModelDto, Long> {

    private final ModelRepository modelRepository;
    private final ModelMapper modelMapper;

    @Override
    protected JpaRepository<Model, Long> getRepository() {
        return modelRepository;
    }

    @Override
    protected ModelDto toDto(Model entity) {
        return modelMapper.toDto(entity);
    }

    @Override
    protected Model toEntity(ModelDto dto) {
        return modelMapper.toEntity(dto);
    }
}
