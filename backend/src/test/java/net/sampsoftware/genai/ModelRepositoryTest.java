package net.sampsoftware.genai;

import net.sampsoftware.genai.model.Model;
import net.sampsoftware.genai.repository.ModelRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
public class ModelRepositoryTest extends AbstractPostgresTest {

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