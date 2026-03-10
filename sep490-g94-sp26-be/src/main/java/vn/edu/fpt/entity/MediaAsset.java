package vn.edu.fpt.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import vn.edu.fpt.util.enums.MediaAssetOwnerType;

@Entity
@Table(name = "media_assets", schema = "wedding")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class MediaAsset extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Integer id;

    Integer ownerId;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(
            name = "owner_type",
            nullable = false
    )
    MediaAssetOwnerType ownerType;

    @Column(name = "image_orig_key")
    String imageOrigKey;

    @Column(name = "image_thumb_key")
    String imageThumbKey;

    @Column(name = "image_medium_key")
    String imageMediumKey;

    @Column(name = "image_large_key")
    String imageLargeKey;
}
