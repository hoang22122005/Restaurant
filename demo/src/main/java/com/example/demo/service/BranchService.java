package com.example.demo.service;

import com.example.demo.dto.BranchDTO;
import com.example.demo.entity.Branch;
import com.example.demo.entity.Restaurant;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.BranchRepository;
import com.example.demo.repository.RestaurantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BranchService {

    private final BranchRepository branchRepository;
    private final RestaurantRepository restaurantRepository;

    public List<BranchDTO> findAll() {
        return branchRepository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    public BranchDTO findById(String id) {
        return toDTO(branchRepository.findById(id.trim())
                .orElseThrow(() -> new ResourceNotFoundException("Branch not found: " + id)));
    }

    public BranchDTO create(BranchDTO dto) {
        // 1. Generate new ID
        Branch lastBranch = branchRepository.findFirstByOrderByBranchIDDesc();
        long nextNumber = 1;
        String prefix = "BRA";
        
        if (lastBranch != null && lastBranch.getBranchID() != null) {
            String lastId = lastBranch.getBranchID().trim();
            if (lastId.startsWith(prefix)) {
                try {
                    nextNumber = Long.parseLong(lastId.substring(prefix.length())) + 1;
                } catch (Exception e) {
                    nextNumber = 1;
                }
            }
        }
        String newID = prefix + String.format("%02d", nextNumber);
        dto.setBranchID(newID);

        Restaurant restaurant = restaurantRepository.findById(dto.getRestaurantID().trim())
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found: " + dto.getRestaurantID()));
        Branch entity = toEntity(dto, restaurant);
        return toDTO(branchRepository.save(entity));
    }

    public BranchDTO update(String id, BranchDTO dto) {
        Branch entity = branchRepository.findById(id.trim())
                .orElseThrow(() -> new ResourceNotFoundException("Branch not found: " + id));
        Restaurant restaurant = restaurantRepository.findById(dto.getRestaurantID().trim())
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found: " + dto.getRestaurantID()));
        entity.setBranchName(dto.getBranchName());
        entity.setAddress(dto.getAddress());
        entity.setCity(dto.getCity());
        entity.setRegion(dto.getRegion());
        entity.setPhoneNumber(dto.getPhoneNumber());
        entity.setEmail(dto.getEmail());
        if (dto.getEstablishedDate() != null) {
            entity.setEstablishedDate(LocalDate.parse(dto.getEstablishedDate()));
        }
        entity.setStatus(dto.getStatus());
        entity.setRestaurant(restaurant);
        return toDTO(branchRepository.save(entity));
    }

    public void delete(String id) {
        if (!branchRepository.existsById(id.trim())) {
            throw new ResourceNotFoundException("Branch not found: " + id);
        }
        branchRepository.deleteById(id.trim());
    }

    private BranchDTO toDTO(Branch e) {
        return BranchDTO.builder()
                .branchID(e.getBranchID() != null ? e.getBranchID().trim() : null)
                .branchName(e.getBranchName())
                .address(e.getAddress())
                .city(e.getCity())
                .region(e.getRegion())
                .phoneNumber(e.getPhoneNumber())
                .email(e.getEmail())
                .establishedDate(e.getEstablishedDate() != null ? e.getEstablishedDate().toString() : null)
                .status(e.getStatus())
                .restaurantID(e.getRestaurant() != null && e.getRestaurant().getRestaurantID() != null
                        ? e.getRestaurant().getRestaurantID().trim() : null)
                .restaurantName(e.getRestaurant() != null ? e.getRestaurant().getRestaurantName() : null)
                .build();
    }

    private Branch toEntity(BranchDTO dto, Restaurant restaurant) {
        return Branch.builder()
                .branchID(dto.getBranchID())
                .branchName(dto.getBranchName())
                .address(dto.getAddress())
                .city(dto.getCity())
                .region(dto.getRegion())
                .phoneNumber(dto.getPhoneNumber())
                .email(dto.getEmail())
                .establishedDate(dto.getEstablishedDate() != null ? LocalDate.parse(dto.getEstablishedDate()) : LocalDate.now())
                .status(dto.getStatus())
                .restaurant(restaurant)
                .build();
    }
}
