package net.sampsoftware.genai.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.sampsoftware.genai.model.Item;
import net.sampsoftware.genai.service.ItemService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/items")
@RequiredArgsConstructor
public class ItemController {

    private final ItemService itemService;

    @GetMapping
    public ResponseEntity<List<Item>> getAllItems(
            @RequestParam(required = false) String itemType,
            @RequestParam(required = false) String searchTerm) {

        log.debug("Getting items - type: {}, search: {}", itemType, searchTerm);

        List<Item> items;
        if (searchTerm != null && !searchTerm.trim().isEmpty()) {
            items = itemService.searchItems(itemType, searchTerm);
        } else if (itemType != null && !itemType.trim().isEmpty()) {
            items = itemService.getItemsByType(itemType);
        } else {
            items = itemService.getAllItems();
        }

        return ResponseEntity.ok(items);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Item> getItem(@PathVariable Long id) {
        log.debug("Getting item with id: {}", id);

        return itemService.getItemById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Item> createItem(@RequestBody Item item) {
        log.debug("Creating item: {}", item.getName());

        Item created = itemService.createItem(item);
        return ResponseEntity.ok(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Item> updateItem(@PathVariable Long id, @RequestBody Item item) {
        log.debug("Updating item with id: {}", id);

        try {
            Item updated = itemService.updateItem(id, item);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteItem(@PathVariable Long id) {
        log.debug("Deleting item with id: {}", id);

        try {
            itemService.deleteItem(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/types")
    public ResponseEntity<List<String>> getItemTypes() {
        log.debug("Getting all item types");

        List<String> types = itemService.getAllItemTypes();
        return ResponseEntity.ok(types);
    }

    @GetMapping("/search")
    public ResponseEntity<List<Item>> searchItems(
            @RequestParam(required = false) String itemType,
            @RequestParam(required = false) String searchTerm) {

        log.debug("Searching items - type: {}, term: {}", itemType, searchTerm);

        List<Item> items = itemService.searchItems(itemType, searchTerm);
        return ResponseEntity.ok(items);
    }

    @GetMapping("/creators")
    public ResponseEntity<List<String>> getAllCreators() {
        log.debug("Getting all creators");

        List<String> creators = itemService.getAllCreators();
        return ResponseEntity.ok(creators);
    }

    @GetMapping("/years")
    public ResponseEntity<List<String>> getAllCreatedYears() {
        log.debug("Getting all created years");

        List<String> years = itemService.getAllCreatedYears();
        return ResponseEntity.ok(years);
    }
}
