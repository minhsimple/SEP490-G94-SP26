package vn.edu.fpt.dto.response.location;

import jakarta.persistence.Column;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;

@AllArgsConstructor
public class LocationResponse {

    private Integer id;

    private String code;

    private String name;

    private String address;

    private String notes;
}
