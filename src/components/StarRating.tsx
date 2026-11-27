interface StarRatingProps {
  rating: number;
}

export function StarRating({ rating }: StarRatingProps) {
  const stars = [1, 2, 3, 4, 5].map((index) =>
    rating >= index - 0.15
      ? 'star'
      : rating >= index - 0.65
        ? 'star_half'
        : 'star_outline',
  );

  return (
    <div
      className="flex items-center gap-0.5 text-accent"
      aria-label={`${rating} out of 5 stars`}
    >
      {stars.map((icon, index) => (
        <span
          key={index}
          className="material-symbols-outlined text-body-md"
          style={{
            fontVariationSettings: icon === 'star_outline' ? "'FILL' 0" : "'FILL' 1",
          }}
          aria-hidden="true"
        >
          {icon}
        </span>
      ))}
    </div>
  );
}
