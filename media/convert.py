# Convert all .mov files in directory to gif @
# import os
# from moviepy.editor import VideoFileClip

# def convert_mov_to_gif(directory):
#   for filename in os.listdir(directory):
#     if filename.endswith(".mov"):
#       filepath = os.path.join(directory, filename)
#       clip = VideoFileClip(filepath)
#       gif_filename = filename.replace(".mov", ".gif")
#       gif_filepath = os.path.join(directory, gif_filename)
#       clip.write_gif(gif_filepath, fps=10, program="ffmpeg")

# # Replace "your_directory" with the actual directory path
# convert_mov_to_gif(".")


# import os
# from moviepy.editor import VideoFileClip
# from PIL import Image

# # Use the correct resampling method for resizing
# if not hasattr(Image, 'Resampling'):
#     Image.Resampling = Image

# def convert_mov_to_gif(directory, target_width, fps=10):
#     for filename in os.listdir(directory):
#         if filename.endswith(".mov"):
#             filepath = os.path.join(directory, filename)
#             clip = VideoFileClip(filepath)

#             # Resize the video clip to the target width while maintaining aspect ratio
#             clip_resized = clip.resize(width=target_width)

#             gif_filename = filename.replace(".mov", ".gif")
#             gif_filepath = os.path.join(directory, gif_filename)

#             # Write the GIF with the specified fps and correct resampling method
#             clip_resized.write_gif(gif_filepath, fps=fps, program="ffmpeg", opt="optimize")

#             print(f"Converted {filename} to {gif_filename} with width {target_width} pixels.")

# # Example usage:
# # Replace "." with the actual directory path if needed
# convert_mov_to_gif(".", target_width=800, fps=10)

import os
from moviepy.editor import VideoFileClip

def convert_mov_to_gif(directory, target_width=400, fps=15):
    for filename in os.listdir(directory):
        if filename.endswith(".mov"):
            filepath = os.path.join(directory, filename)
            clip = VideoFileClip(filepath)

            # Resize using LANCZOS filter to reduce fuzziness
            clip_resized = clip.resize(width=target_width)

            gif_filename = filename.replace(".mov", ".gif")
            gif_filepath = os.path.join(directory, gif_filename)

            # Write the GIF with dithering and the specified fps to reduce fuzziness
            clip_resized.write_gif(
                gif_filepath,
                fps=fps,
                program="ffmpeg",
                opt="optimize",
                fuzz=0  # Disable fuzz to prevent color inaccuracies
            )

            print(f"Converted {filename} to {gif_filename} with width {target_width} pixels.")

# Example usage:
convert_mov_to_gif(".", target_width=800, fps=15)
