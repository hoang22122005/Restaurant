package com.example.demo.service;

import com.example.demo.dto.DishDTO;
import com.example.demo.entity.Dish;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.DishRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DishService {

    private final DishRepository dishRepository;

    public List<DishDTO> findAll() {
        return dishRepository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    public DishDTO findById(String id) {
        return toDTO(dishRepository.findById(id.trim())
                .orElseThrow(() -> new ResourceNotFoundException("Dish not found: " + id)));
    }

    public DishDTO create(DishDTO dto) {
        Dish entity = toEntity(dto);
        entity.setDishID(generateNewID());
        return toDTO(dishRepository.save(entity));
    }

    private String generateNewID() {
        Dish lastDish = dishRepository.findFirstByOrderByDishIDDesc();
        if (lastDish == null) {
            return "DISH000001";
        }
        String lastID = lastDish.getDishID().trim();
        try {
            // Cắt chuỗi bỏ phần "DISH" và chuyển phần số sang Integer
            int number = Integer.parseInt(lastID.substring(4));
            return String.format("DISH%06d", number + 1);
        } catch (Exception e) {
            // Trường hợp mã ID cũ không đúng định dạng, mặc định về DISH000001
            return "DISH000001";
        }
    }

    public DishDTO update(String id, DishDTO dto) {
        Dish entity = dishRepository.findById(id.trim())
                .orElseThrow(() -> new ResourceNotFoundException("Dish not found: " + id));
        entity.setDishName(dto.getDishName());
        entity.setPrice(dto.getPrice());
        entity.setCategory(dto.getCategory());
        entity.setDescription(dto.getDescription());
        entity.setStatus(dto.getStatus());
        return toDTO(dishRepository.save(entity));
    }

    public void delete(String id) {
        if (!dishRepository.existsById(id.trim())) {
            throw new ResourceNotFoundException("Dish not found: " + id);
        }
        dishRepository.deleteById(id.trim());
    }

    private DishDTO toDTO(Dish e) {
        return DishDTO.builder()
                .dishID(e.getDishID() != null ? e.getDishID().trim() : null)
                .dishName(e.getDishName())
                .price(e.getPrice())
                .category(e.getCategory())
                .description(e.getDescription())
                .status(e.getStatus())
                .build();
    }

    private Dish toEntity(DishDTO dto) {
        return Dish.builder()
                .dishID(dto.getDishID())
                .dishName(dto.getDishName())
                .price(dto.getPrice())
                .category(dto.getCategory())
                .description(dto.getDescription())
                .status(dto.getStatus())
                .build();
    }
}
