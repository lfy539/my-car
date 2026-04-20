/**
 * 推荐系统 v1
 * 基于热度和标签的简单推荐
 */

interface RecommendConfig {
  maxResults: number;
}

class RecommendEngine {
  private config: RecommendConfig = {
    maxResults: 6,
  };

  getSimilarWallpapers(
    current: Wallpaper,
    allWallpapers: Wallpaper[]
  ): Wallpaper[] {
    const scored = allWallpapers
      .filter(w => w._id !== current._id)
      .map(w => ({
        wallpaper: w,
        score: this.calculateWallpaperScore(current, w),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, this.config.maxResults);

    return scored.map(s => s.wallpaper);
  }

  private calculateWallpaperScore(current: Wallpaper, candidate: Wallpaper): number {
    let score = 0;

    if (current.brandId === candidate.brandId) {
      score += 50;
    }

    if (current.modelId && current.modelId === candidate.modelId) {
      score += 30;
    }

    const commonTags = current.tags.filter(t => candidate.tags.includes(t));
    score += commonTags.length * 20;

    score += Math.min(candidate.hotScore / 10, 20);

    return score;
  }

  getSimilarSounds(
    current: Sound,
    allSounds: Sound[]
  ): Sound[] {
    const scored = allSounds
      .filter(s => s._id !== current._id)
      .map(s => ({
        sound: s,
        score: this.calculateSoundScore(current, s),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, this.config.maxResults);

    return scored.map(s => s.sound);
  }

  private calculateSoundScore(current: Sound, candidate: Sound): number {
    let score = 0;

    if (current.soundType === candidate.soundType) {
      score += 40;
    }

    if (current.brandId === candidate.brandId) {
      score += 30;
    }

    if (current.modelId && current.modelId === candidate.modelId) {
      score += 20;
    }

    score += Math.min(candidate.hotScore / 10, 20);

    return score;
  }

  getHotWallpapers(allWallpapers: Wallpaper[], limit = 10): Wallpaper[] {
    return [...allWallpapers]
      .sort((a, b) => b.hotScore - a.hotScore)
      .slice(0, limit);
  }

  getHotSounds(allSounds: Sound[], limit = 10): Sound[] {
    return [...allSounds]
      .sort((a, b) => b.hotScore - a.hotScore)
      .slice(0, limit);
  }

  getPersonalized(
    wallpapers: Wallpaper[],
    sounds: Sound[],
    userFavorites: string[],
    limit = 6
  ): (Wallpaper | Sound)[] {
    const favoriteBrands = new Set<string>();
    const favoriteTags = new Set<string>();

    wallpapers
      .filter(w => userFavorites.includes(w._id))
      .forEach(w => {
        favoriteBrands.add(w.brandId);
        w.tags.forEach(t => favoriteTags.add(t));
      });

    const scoredWallpapers = wallpapers
      .filter(w => !userFavorites.includes(w._id))
      .map(w => ({
        item: w,
        type: 'wallpaper' as const,
        score: this.personalScore(w.brandId, w.tags, favoriteBrands, favoriteTags, w.hotScore),
      }));

    const scoredSounds = sounds
      .filter(s => !userFavorites.includes(s._id))
      .map(s => ({
        item: s,
        type: 'sound' as const,
        score: this.personalScore(s.brandId, [], favoriteBrands, favoriteTags, s.hotScore),
      }));

    return [...scoredWallpapers, ...scoredSounds]
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(s => s.item);
  }

  private personalScore(
    brandId: string,
    tags: string[],
    favoriteBrands: Set<string>,
    favoriteTags: Set<string>,
    hotScore: number
  ): number {
    let score = 0;

    if (favoriteBrands.has(brandId)) {
      score += 40;
    }

    tags.forEach(t => {
      if (favoriteTags.has(t)) {
        score += 15;
      }
    });

    score += Math.min(hotScore / 10, 30);

    return score;
  }
}

export const recommendEngine = new RecommendEngine();
