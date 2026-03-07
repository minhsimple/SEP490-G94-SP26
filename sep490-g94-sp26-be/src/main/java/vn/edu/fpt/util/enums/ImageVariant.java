package vn.edu.fpt.util.enums;

public enum ImageVariant {
    THUMB(240, 240, 0.80f),
    MEDIUM(800, 800, 0.82f),
    LARGE(1400, 1400, 0.85f);

    private final int maxW;
    private final int maxH;
    private final float quality;

    ImageVariant(int maxW, int maxH, float quality) {
        this.maxW = maxW;
        this.maxH = maxH;
        this.quality = quality;
    }

    public int maxW() { return maxW; }
    public int maxH() { return maxH; }
    public float quality() { return quality; }
}
