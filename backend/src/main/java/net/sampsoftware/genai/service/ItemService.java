package net.sampsoftware.genai.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.sampsoftware.genai.model.Item;
import net.sampsoftware.genai.repository.ItemRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class ItemService {

    private final ItemRepository itemRepository;

    @Transactional(readOnly = true)
    public List<Item> getAllItems() {
        return itemRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Optional<Item> getItemById(Long id) {
        return itemRepository.findById(id);
    }

    @Transactional(readOnly = true)
    public List<Item> getItemsByType(String itemType) {
        return itemRepository.findByItemTypeOrderByName(itemType);
    }

    @Transactional(readOnly = true)
    public List<Item> searchItems(String itemType, String searchTerm) {
        return itemRepository.searchItems(itemType, searchTerm);
    }

    @Transactional
    public Item createItem(Item item) {
        log.debug("Creating new item: {} (type: {})", item.getName(), item.getItemType());
        return itemRepository.save(item);
    }

    @Transactional
    public Item updateItem(Long id, Item updatedItem) {
        return itemRepository.findById(id)
                .map(existingItem -> {
                    // Update fields
                    existingItem.setName(updatedItem.getName());
                    existingItem.setDescription(updatedItem.getDescription());
                    existingItem.setCreator(updatedItem.getCreator());
                    existingItem.setCreatedYear(updatedItem.getCreatedYear());
                    existingItem.setExternalId(updatedItem.getExternalId());
                    existingItem.setSource(updatedItem.getSource());
                    existingItem.setAttributes(updatedItem.getAttributes());

                    return itemRepository.save(existingItem);
                })
                .orElseThrow(() -> new RuntimeException("Item not found with id: " + id));
    }

    @Transactional
    public void deleteItem(Long id) {
        if (!itemRepository.existsById(id)) {
            throw new RuntimeException("Item not found with id: " + id);
        }
        itemRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<String> getAllItemTypes() {
        return itemRepository.findAllItemTypes();
    }

    @Transactional(readOnly = true)
    public List<String> getAllCreators() {
        return itemRepository.findAllCreators();
    }

    @Transactional(readOnly = true)
    public List<String> getAllCreatedYears() {
        return itemRepository.findAllCreatedYears();
    }

    @Transactional(readOnly = true)
    public List<Item> getItemsByCreator(String creator) {
        return itemRepository.findByCreator(creator);
    }

    @Transactional(readOnly = true)
    public List<Item> getItemsByYear(String year) {
        return itemRepository.findByCreatedYear(year);
    }

    @Transactional(readOnly = true)
    public List<Item> getItemsBySource(String source) {
        return itemRepository.findBySource(source);
    }

    @Transactional(readOnly = true)
    public long getItemCountByType(String itemType) {
        return itemRepository.countByItemType(itemType);
    }

    // Convenience methods for specific item types
    public List<Item> getAllBooks() {
        return getItemsByType("book");
    }

    public List<Item> getAllRankedBooks() {
        return getItemsByType("ranked_book");
    }

    public List<Item> getAllPeople() {
        return getItemsByType("person");
    }

    public List<Item> getAllMovies() {
        return getItemsByType("movie");
    }

    public List<Item> getAllPapers() {
        return getItemsByType("academic_paper");
    }
}
