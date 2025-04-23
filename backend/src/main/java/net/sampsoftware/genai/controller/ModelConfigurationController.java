package net.sampsoftware.genai.controller;

import net.sampsoftware.genai.model.ModelConfiguration;
import net.sampsoftware.genai.repository.ModelConfigurationRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/configs")
public class ModelConfigurationController {
    private final ModelConfigurationRepository repo;
    public ModelConfigurationController(ModelConfigurationRepository repo) { this.repo = repo; }

    @GetMapping public List<ModelConfiguration> all() { return repo.findAll(); }
    @GetMapping("/{id}") public ModelConfiguration one(@PathVariable Long id) { return repo.findById(id).orElseThrow(); }
    @PostMapping public ModelConfiguration create(@RequestBody ModelConfiguration c) { return repo.save(c); }
    @PutMapping("/{id}") public ModelConfiguration update(@PathVariable Long id, @RequestBody ModelConfiguration c) {
        c.setId(id); return repo.save(c);
    }
    @DeleteMapping("/{id}") public void delete(@PathVariable Long id) { repo.deleteById(id); }
}
