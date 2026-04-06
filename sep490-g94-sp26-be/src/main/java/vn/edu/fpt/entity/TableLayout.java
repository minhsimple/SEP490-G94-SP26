package vn.edu.fpt.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import vn.edu.fpt.util.enums.TableLayoutEnum;

@Entity
@Table(name = "table_layouts", schema = "wedding")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TableLayout extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Integer id;

    @Enumerated(EnumType.STRING)
    @Column(name = "table_layout", nullable = false)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    TableLayoutEnum tableLayout;

    @Column(name = "contract_id")
    Integer contractId;

    @Column(name = "group_name")
    String groupName;

    @Column(name = "number_of_tables")
    Integer numberOfTables;
}
