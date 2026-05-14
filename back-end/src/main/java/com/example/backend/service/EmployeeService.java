package com.example.backend.service;

import com.example.backend.config.DataSourceContextHolder;
import com.example.backend.dto.EmployeeDTO;
import com.example.backend.entity.Branch;
import com.example.backend.entity.Employee;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.repository.BranchRepository;
import com.example.backend.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final BranchRepository branchRepository;

    public List<EmployeeDTO> findAll() {
        return employeeRepository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<EmployeeDTO> findByBranch(String branchID) {
        return employeeRepository.findByBranch_BranchID(branchID.trim()).stream()
                .map(this::toDTO).collect(Collectors.toList());
    }

    public EmployeeDTO findById(String id) {
        return toDTO(employeeRepository.findById(id.trim())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found: " + id)));
    }

    public EmployeeDTO create(EmployeeDTO dto) {
        // 1. Xác định Site hiện tại để lấy tiền tố và BranchID
        String currentSite = DataSourceContextHolder.getBranchContext();
        String branchID = "BRA01"; // Mặc định Site 1
        String prefix = "BRA01";

        if ("SITE2".equals(currentSite)) {
            branchID = "BRA02";
            prefix = "BRA02";
        }

        // 2. Tìm ID lớn nhất theo tiền tố của chi nhánh này
        Employee lastEmployee = employeeRepository.findFirstByEmployeeIDStartingWithOrderByEmployeeIDDesc(prefix);
        long nextNumber = 1;
        if (lastEmployee != null && lastEmployee.getEmployeeID() != null) {
            String lastId = lastEmployee.getEmployeeID().trim();
            try {
                // Tách phần số từ ID (ví dụ BRA010005 -> lấy 0005)
                String numberPart = lastId.substring(prefix.length());
                nextNumber = Long.parseLong(numberPart) + 1;
            } catch (Exception e) {
                nextNumber = 1;
            }
        }

        // 3. Tạo ID mới (định dạng 4 số 0 để tổng cộng là 9 ký tự: BRA01 + 0005)
        String newID = prefix + String.format("%04d", nextNumber);
        
        // 4. Lấy thông tin Branch từ DB
        final String finalBranchID = branchID;
        Branch branch = branchRepository.findById(finalBranchID)
                .orElseThrow(() -> new ResourceNotFoundException("Branch not found: " + finalBranchID));

        // 5. Lưu vào Database
        Employee entity = toEntity(dto, branch);
        entity.setEmployeeID(newID);
        return toDTO(employeeRepository.save(entity));
    }

    public EmployeeDTO update(String id, EmployeeDTO dto) {
        Employee entity = employeeRepository.findById(id.trim())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found: " + id));
        Branch branch = branchRepository.findById(dto.getBranchID().trim())
                .orElseThrow(() -> new ResourceNotFoundException("Branch not found: " + dto.getBranchID()));
        entity.setFullName(dto.getFullName());
        entity.setGender(dto.getGender());
        if (dto.getDateOfBirth() != null) {
            entity.setDateOfBirth(LocalDate.parse(dto.getDateOfBirth()));
        }
        entity.setPosition(dto.getPosition());
        entity.setSalary(dto.getSalary());
        if (dto.getHireDate() != null) {
            entity.setHireDate(LocalDate.parse(dto.getHireDate()));
        }
        entity.setStatus(dto.getStatus());
        entity.setBranch(branch);
        return toDTO(employeeRepository.save(entity));
    }

    public void delete(String id) {
        if (!employeeRepository.existsById(id.trim())) {
            throw new ResourceNotFoundException("Employee not found: " + id);
        }
        employeeRepository.deleteById(id.trim());
    }

    private EmployeeDTO toDTO(Employee e) {
        return EmployeeDTO.builder()
                .employeeID(e.getEmployeeID() != null ? e.getEmployeeID().trim() : null)
                .fullName(e.getFullName())
                .gender(e.getGender())
                .dateOfBirth(e.getDateOfBirth() != null ? e.getDateOfBirth().toString() : null)
                .position(e.getPosition())
                .salary(e.getSalary())
                .hireDate(e.getHireDate() != null ? e.getHireDate().toString() : null)
                .status(e.getStatus())
                .branchID(e.getBranch() != null && e.getBranch().getBranchID() != null
                        ? e.getBranch().getBranchID().trim() : null)
                .branchName(e.getBranch() != null ? e.getBranch().getBranchName() : null)
                .build();
    }

    private Employee toEntity(EmployeeDTO dto, Branch branch) {
        return Employee.builder()
                .employeeID(dto.getEmployeeID())
                .fullName(dto.getFullName())
                .gender(dto.getGender())
                .dateOfBirth(dto.getDateOfBirth() != null ? LocalDate.parse(dto.getDateOfBirth()) : null)
                .position(dto.getPosition())
                .salary(dto.getSalary())
                .hireDate(dto.getHireDate() != null ? LocalDate.parse(dto.getHireDate()) : LocalDate.now())
                .status(dto.getStatus())
                .branch(branch)
                .build();
    }
}
