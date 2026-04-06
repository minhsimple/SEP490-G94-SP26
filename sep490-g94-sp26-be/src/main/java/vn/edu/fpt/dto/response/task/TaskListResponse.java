package vn.edu.fpt.dto.response.task;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import vn.edu.fpt.util.enums.BookingTime;
import vn.edu.fpt.util.enums.RecordStatus;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskListResponse {
    private Integer id;
    private Integer contractId;
    private String name;
    private String description;
    private String contractNo;
    private String hallName;
    private BookingTime bookingTime;
    private RecordStatus status;
    private List<TaskResponse> tasks;
}

