package vn.edu.fpt.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.*;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.result.MockMvcResultHandlers;
import vn.edu.fpt.dto.request.customer.CustomerRequest;
import vn.edu.fpt.dto.response.customer.CustomerResponse;
import vn.edu.fpt.service.CustomerService;

import java.util.ArrayList;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
@DisplayName("Customer Controller Tests")
public class CustomerControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private CustomerService customerService;

    @Autowired
    private ObjectMapper objectMapper;

    private CustomerRequest customerRequest;
    private CustomerResponse customerResponse;

    @BeforeEach
    public void setUp() {
        // Setup test data
        customerRequest = new CustomerRequest();
        customerRequest.setFullName("John Doe");
        customerRequest.setCitizenIdNumber("123456789");
        customerRequest.setEmail("john@example.com");
        customerRequest.setPhone("0123456789");
        customerRequest.setAddress("123 Main St");
        customerRequest.setLocationId(1);

        customerResponse = new CustomerResponse();
        customerResponse.setId(1);
        customerResponse.setFullName("John Doe");
        customerResponse.setCitizenIdNumber("123456789");
        customerResponse.setEmail("john@example.com");
        customerResponse.setPhone("0123456789");
        customerResponse.setAddress("123 Main St");
        customerResponse.setLocationId(1);
    }

    @Test
    @DisplayName("Create customer successfully with images")
    public void testCreateCustomer_Success() throws Exception {
        // Arrange
        MockMultipartFile imageFile1 = new MockMultipartFile(
                "imageFiles",
                "test1.jpg",
                "image/jpeg",
                "test image content 1".getBytes()
        );
        MockMultipartFile imageFile2 = new MockMultipartFile(
                "imageFiles",
                "test2.jpg",
                "image/jpeg",
                "test image content 2".getBytes()
        );
        MockMultipartFile customerRequestPart = new MockMultipartFile(
                "customerRequest",
                "",
                "application/json",
                objectMapper.writeValueAsBytes(customerRequest)
        );

        when(customerService.createCustomer(any(CustomerRequest.class), anyList()))
                .thenReturn(customerResponse);

        // Act & Assert
        mockMvc.perform(multipart("/api/v1/customer/create")
                .file(customerRequestPart)
                .file(imageFile1)
                .file(imageFile2))
                .andDo(MockMvcResultHandlers.print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.id").value(1))
                .andExpect(jsonPath("$.data.fullName").value("John Doe"))
                .andExpect(jsonPath("$.data.email").value("john@example.com"))
                .andExpect(jsonPath("$.data.phone").value("0123456789"));
    }

    @Test
    @DisplayName("Create customer with empty images list")
    public void testCreateCustomer_EmptyImages() throws Exception {
        // Arrange
        MockMultipartFile customerRequestPart = new MockMultipartFile(
                "customerRequest",
                "",
                "application/json",
                objectMapper.writeValueAsBytes(customerRequest)
        );

        when(customerService.createCustomer(any(CustomerRequest.class), anyList()))
                .thenReturn(customerResponse);

        // Act & Assert
        mockMvc.perform(multipart("/api/v1/customer/create")
                .file(customerRequestPart))
                .andDo(MockMvcResultHandlers.print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.id").value(1));
    }

    @Test
    @DisplayName("Create customer with invalid request - missing required field")
    public void testCreateCustomer_InvalidRequest() throws Exception {
        // Arrange - Create request with missing citizenIdNumber (required field)
        CustomerRequest invalidRequest = new CustomerRequest();
        invalidRequest.setFullName("John Doe");
        invalidRequest.setEmail("john@example.com");
        invalidRequest.setPhone("0123456789");
        invalidRequest.setAddress("123 Main St");
        invalidRequest.setLocationId(1);
        // Missing citizenIdNumber which is required

        MockMultipartFile customerRequestPart = new MockMultipartFile(
                "customerRequest",
                "",
                "application/json",
                objectMapper.writeValueAsBytes(invalidRequest)
        );
        MockMultipartFile imageFile = new MockMultipartFile(
                "imageFiles",
                "test.jpg",
                "image/jpeg",
                "test image content".getBytes()
        );

        // Act & Assert
        mockMvc.perform(multipart("/api/v1/customer/create")
                .file(customerRequestPart)
                .file(imageFile))
                .andDo(MockMvcResultHandlers.print())
                .andExpect(status().is4xxClientError());
    }
}

