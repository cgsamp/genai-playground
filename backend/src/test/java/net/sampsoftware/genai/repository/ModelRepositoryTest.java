package net.sampsoftware.genai.repository;

import net.sampsoftware.genai.model.Model;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
public class ModelRepositoryTest  {

    @Autowired
    private ModelRepository modelRepository;

    @Test
    void canSaveAndFindModel() {
        Model model = new Model(null, "gpt-4", "openai", "https://api.openai.com/v1", "test model");
        Model saved = modelRepository.save(model);

        assertThat(saved.getId()).isNotNull();
        assertThat(modelRepository.findById(saved.getId())).contains(saved);
    }
}