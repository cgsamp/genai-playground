package net.sampsoftware.genai.mapper;

import net.sampsoftware.genai.dto.ModelDto;
import net.sampsoftware.genai.model.Model;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ModelMapper {
    ModelDto toDto(Model entity);
    Model toEntity(ModelDto dto);
}
