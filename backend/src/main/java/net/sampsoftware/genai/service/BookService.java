package net.sampsoftware.genai.service;

import lombok.RequiredArgsConstructor;
import net.sampsoftware.genai.model.RankedBook;
import net.sampsoftware.genai.repository.RankedBookRepository;

import java.util.List;

import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class BookService {
    private final RankedBookRepository bookRepo;

    public List<RankedBook> findAll() {
        List<RankedBook> books = bookRepo.findAll();
        return books;
    }

}