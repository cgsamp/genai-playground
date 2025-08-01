package net.sampsoftware.genai.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.sampsoftware.genai.dto.*;
import net.sampsoftware.genai.exception.ResourceNotFoundException;
import net.sampsoftware.genai.model.Prompt;
import net.sampsoftware.genai.model.PromptType;
import net.sampsoftware.genai.repository.PromptRepository;
import net.sampsoftware.genai.repository.PromptTypeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PromptService {

    private final PromptRepository promptRepository;
    private final PromptTypeRepository promptTypeRepository;

    /**
     * Get all active prompts (excludes soft-deleted ones)
     */
    @Transactional(readOnly = true)
    public List<PromptDto> getAllActivePrompts() {
        log.debug("Fetching all active prompts");
        return promptRepository.findAllActive().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Get prompt by ID (includes deleted ones as per requirements)
     */
    @Transactional(readOnly = true)
    public PromptDto getPromptById(Integer id) {
        log.debug("Fetching prompt by id: {}", id);
        return promptRepository.findById(id)
                .map(this::convertToDto)
                .orElseThrow(() -> new ResourceNotFoundException("Prompt not found with id: " + id));
    }

    /**
     * Get active prompts by type
     */
    @Transactional(readOnly = true)
    public List<PromptDto> getActivePromptsByType(Integer typeId) {
        log.debug("Fetching active prompts by type id: {}", typeId);
        PromptType type = promptTypeRepository.findById(typeId)
                .orElseThrow(() -> new ResourceNotFoundException("PromptType not found with id: " + typeId));
        
        return promptRepository.findAllActiveByType(type).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Search active prompts by name
     */
    @Transactional(readOnly = true)
    public List<PromptDto> searchActivePrompts(String name) {
        log.debug("Searching active prompts with name containing: {}", name);
        return promptRepository.findActiveByNameContaining(name).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Create a new prompt
     */
    @Transactional
    public PromptDto createPrompt(PromptCreateRequest request) {
        log.debug("Creating new prompt: {}", request.getName());
        
        PromptType type = promptTypeRepository.findById(request.getTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("PromptType not found with id: " + request.getTypeId()));

        Prompt prompt = Prompt.builder()
                .name(request.getName())
                .text(request.getText())
                .type(type)
                .build();

        Prompt saved = promptRepository.save(prompt);
        log.info("Created prompt with id: {}, name: {}", saved.getId(), saved.getName());
        
        return convertToDto(saved);
    }

    /**
     * Update a prompt using immutable pattern:
     * 1. Mark the existing prompt as deleted (soft delete)
     * 2. Create a new prompt with updated content
     * 
     * This preserves the history of prompts for audit/reference purposes
     */
    @Transactional
    public PromptDto updatePrompt(Integer id, PromptUpdateRequest request) {
        log.debug("Updating prompt with id: {}", id);
        
        // Find the existing prompt
        Prompt existingPrompt = promptRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Prompt not found with id: " + id));
        
        // Check if already deleted
        if (existingPrompt.isDeleted()) {
            throw new IllegalStateException("Cannot update a deleted prompt");
        }

        // Validate the new type exists
        PromptType newType = promptTypeRepository.findById(request.getTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("PromptType not found with id: " + request.getTypeId()));

        // Soft delete the existing prompt
        existingPrompt.markDeleted();
        promptRepository.save(existingPrompt);
        log.debug("Marked prompt {} as deleted", id);

        // Create new prompt with updated content
        Prompt newPrompt = Prompt.builder()
                .name(request.getName())
                .text(request.getText())
                .type(newType)
                .build();

        Prompt saved = promptRepository.save(newPrompt);
        log.info("Created new prompt version with id: {} (replacing id: {})", saved.getId(), id);
        
        return convertToDto(saved);
    }

    /**
     * Soft delete a prompt
     */
    @Transactional
    public void deletePrompt(Integer id) {
        log.debug("Soft deleting prompt with id: {}", id);
        
        Prompt prompt = promptRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Prompt not found with id: " + id));
        
        if (prompt.isDeleted()) {
            log.warn("Prompt {} is already deleted", id);
            return;
        }

        prompt.markDeleted();
        promptRepository.save(prompt);
        log.info("Soft deleted prompt with id: {}", id);
    }

    /**
     * Get all prompt types
     */
    @Transactional(readOnly = true)
    public List<PromptTypeDto> getAllPromptTypes() {
        log.debug("Fetching all prompt types");
        return promptTypeRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Convert Prompt entity to DTO
     */
    private PromptDto convertToDto(Prompt prompt) {
        PromptDto dto = new PromptDto();
        dto.setId(prompt.getId());
        dto.setName(prompt.getName());
        dto.setText(prompt.getText());
        dto.setType(convertToDto(prompt.getType()));
        dto.setCreatedAt(prompt.getCreatedAt());
        dto.setUpdatedAt(prompt.getUpdatedAt());
        dto.setDeletedDate(prompt.getDeletedDate());
        dto.setDeleted(prompt.isDeleted());
        return dto;
    }

    /**
     * Convert PromptType entity to DTO
     */
    private PromptTypeDto convertToDto(PromptType promptType) {
        PromptTypeDto dto = new PromptTypeDto();
        dto.setId(promptType.getId());
        dto.setPromptType(promptType.getPromptType());
        dto.setDescription(promptType.getDescription());
        dto.setCreatedAt(promptType.getCreatedAt());
        dto.setUpdatedAt(promptType.getUpdatedAt());
        return dto;
    }
}