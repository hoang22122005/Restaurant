package com.example.demo.controller;

import com.example.demo.dto.RevenueReportDTO;
import com.example.demo.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.time.Year;
import java.util.List;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {
    private final ReportService service;

    @GetMapping("/revenue-by-branch")
    public List<RevenueReportDTO> revenueByBranch() { return service.revenueByBranch(); }

    @GetMapping("/revenue-by-month")
    public List<RevenueReportDTO> revenueByMonth(
            @RequestParam(required = false) String branchID,
            @RequestParam(required = false) Integer year) {
        int y = (year != null) ? year : Year.now().getValue();
        return service.revenueByMonth(branchID, y);
    }
}
