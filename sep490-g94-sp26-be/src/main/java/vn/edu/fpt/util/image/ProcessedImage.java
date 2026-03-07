package vn.edu.fpt.util.image;

public record ProcessedImage(
        String filename,
        String contentType,
        byte[] bytes
) {
    public long size() { return bytes.length; }
}
