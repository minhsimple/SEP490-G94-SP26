package vn.edu.fpt.dto.request.location;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LocationRequest {

    private String code;

    private String name;

    private String address;

    private String notes;
}
