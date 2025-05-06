package net.sampsoftware.genai.controller;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

public abstract class CrudDtoController<T, D, ID> {

    protected abstract JpaRepository<T, ID> getRepository();
    protected abstract D toDto(T entity);
    protected abstract T toEntity(D dto);

    @GetMapping
    public List<D> list() {
        return getRepository().findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<D> get(@PathVariable ID id) {
        Optional<T> result = getRepository().findById(id);
        return result.map(t -> ResponseEntity.ok(toDto(t)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<D> create(@RequestBody D dto) {
        T saved = getRepository().save(toEntity(dto));
        return ResponseEntity.ok(toDto(saved));
    }

    @PutMapping("/{id}")
    public ResponseEntity<D> update(@PathVariable ID id, @RequestBody D dto) {
        if (!getRepository().existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        T updated = toEntity(dto);
        return ResponseEntity.ok(toDto(getRepository().save(updated)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable ID id) {
        if (!getRepository().existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        getRepository().deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
