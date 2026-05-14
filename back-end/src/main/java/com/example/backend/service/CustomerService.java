package com.example.backend.service;

import com.example.backend.config.DataSourceContextHolder;
import com.example.backend.dto.CustomerDTO;
import com.example.backend.entity.Branch;
import com.example.backend.entity.Customer;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.repository.BranchRepository;
import com.example.backend.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final BranchRepository branchRepository;

    public List<CustomerDTO> findAll() {
        return customerRepository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<CustomerDTO> findByBranch(String branchID) {
        return customerRepository.findByBranch_BranchID(branchID.trim()).stream()
                .map(this::toDTO).collect(Collectors.toList());
    }

    public CustomerDTO findById(String id) {
        return toDTO(customerRepository.findById(id.trim())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found: " + id)));
    }

    public CustomerDTO create(CustomerDTO dto) {
        // 1. Xác định Site hiện tại để lấy tiền tố và BranchID
        String currentSite = DataSourceContextHolder.getBranchContext();
        String branchID = "BRA01"; // Mặc định Site 1
        String prefix = "BRA01";

        if ("SITE2".equals(currentSite)) {
            branchID = "BRA02";
            prefix = "BRA02";
        } else if ("MAIN".equals(currentSite)) {
            branchID = "BRA01"; // Hoặc tùy logic Server tổng
            prefix = "BRA01";
        }

        // 2. Tìm ID lớn nhất theo tiền tố của chi nhánh này
        Customer lastCustomer = customerRepository.findFirstByCustomerIDStartingWithOrderByCustomerIDDesc(prefix);
        long nextNumber = 1;
        if (lastCustomer != null && lastCustomer.getCustomerID() != null) {
            String lastId = lastCustomer.getCustomerID().trim();
            try {
                // Tách phần số từ ID (ví dụ BRA010022 -> lấy 0022)
                String numberPart = lastId.substring(prefix.length());
                nextNumber = Long.parseLong(numberPart) + 1;
            } catch (Exception e) {
                nextNumber = 1;
            }
        }

        // 3. Tạo ID mới (định dạng 4 số 0: 0022, 0023...)
        String newID = prefix + String.format("%04d", nextNumber);

        // 4. Lấy thông tin Branch từ DB
        final String finalBranchID = branchID;
        Branch branch = branchRepository.findById(finalBranchID)
                .orElseThrow(() -> new ResourceNotFoundException("Branch not found: " + finalBranchID));

        // 5. Lưu vào Database
        Customer entity = toEntity(dto, branch);
        entity.setCustomerID(newID);
        return toDTO(customerRepository.save(entity));
    }

    public CustomerDTO update(String id, CustomerDTO dto) {
        Customer entity = customerRepository.findById(id.trim())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found: " + id));
        Branch branch = branchRepository.findById(dto.getBranchID().trim())
                .orElseThrow(() -> new ResourceNotFoundException("Branch not found: " + dto.getBranchID()));
        entity.setFullName(dto.getFullName());
        entity.setPhoneNumber(dto.getPhoneNumber());
        entity.setEmail(dto.getEmail());
        entity.setCustomerType(dto.getCustomerType());
        entity.setBranch(branch);
        return toDTO(customerRepository.save(entity));
    }

    public void delete(String id) {
        if (!customerRepository.existsById(id.trim())) {
            throw new ResourceNotFoundException("Customer not found: " + id);
        }
        customerRepository.deleteById(id.trim());
    }

    private CustomerDTO toDTO(Customer e) {
        return CustomerDTO.builder()
                .customerID(e.getCustomerID() != null ? e.getCustomerID().trim() : null)
                .fullName(e.getFullName())
                .phoneNumber(e.getPhoneNumber())
                .email(e.getEmail())
                .customerType(e.getCustomerType())
                .branchID(e.getBranch() != null && e.getBranch().getBranchID() != null
                        ? e.getBranch().getBranchID().trim()
                        : null)
                .branchName(e.getBranch() != null ? e.getBranch().getBranchName() : null)
                .build();
    }

    private Customer toEntity(CustomerDTO dto, Branch branch) {
        return Customer.builder()
                .customerID(dto.getCustomerID())
                .fullName(dto.getFullName())
                .phoneNumber(dto.getPhoneNumber())
                .email(dto.getEmail())
                .customerType(dto.getCustomerType())
                .branch(branch)
                .build();
    }
}
