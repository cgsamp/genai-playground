package net.sampsoftware.genai.mapper;

import net.sampsoftware.genai.dto.ModelConfigurationDto;
import net.sampsoftware.genai.model.Model;
import net.sampsoftware.genai.model.ModelConfiguration;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface ModelConfigurationMapper {

    @Mapping(source = "model.id", target = "modelId")
    @Mapping(source = "model.modelName", target = "modelName")
    @Mapping(source = "model.modelProvider", target = "modelProvider")
    @Mapping(source = "model.costPer1kInputTokens", target = "costPer1kInputTokens")
    @Mapping(source = "model.costPer1kOutputTokens", target = "costPer1kOutputTokens")
    @Mapping(source = "model.contextLength", target = "contextLength")
    ModelConfigurationDto toDto(ModelConfiguration entity);

    @Mapping(target = "model", source = "modelId", qualifiedByName = "modelFromId")
    @Mapping(target = "createdAt", ignore = true)  // Let entity default it
    ModelConfiguration toEntity(ModelConfigurationDto dto);

    @Named("modelFromId")
    default Model modelFromId(Long id) {
        if (id == null) return null;
        Model model = new Model();
        model.setId(id);
        return model;
    }
}
