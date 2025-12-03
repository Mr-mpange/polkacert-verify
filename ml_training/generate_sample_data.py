"""
Generate sample training data for testing
Creates synthetic certificate images for each category
"""

import os
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import random

# Configuration
OUTPUT_DIR = Path('training_data')
SAMPLES_PER_CLASS = 50  # Adjust based on your needs
IMG_SIZE = (800, 600)

# Class directories
CLASSES = ['authentic', 'forged', 'tampered', 'screenshot']

def create_directories():
    """Create training data directories"""
    for class_name in CLASSES:
        (OUTPUT_DIR / class_name).mkdir(parents=True, exist_ok=True)
    print("✅ Directories created")

def generate_certificate_image(text, quality='high', add_noise=False, add_artifacts=False):
    """Generate a synthetic certificate image"""
    # Create image
    img = Image.new('RGB', IMG_SIZE, color='white')
    draw = ImageDraw.Draw(img)
    
    # Try to use a nice font, fallback to default
    try:
        title_font = ImageFont.truetype("arial.ttf", 48)
        text_font = ImageFont.truetype("arial.ttf", 24)
    except:
        title_font = ImageFont.load_default()
        text_font = ImageFont.load_default()
    
    # Draw border
    border_color = (0, 0, 139) if not add_artifacts else (50, 50, 150)
    draw.rectangle([20, 20, IMG_SIZE[0]-20, IMG_SIZE[1]-20], outline=border_color, width=5)
    
    # Draw title
    title = "CERTIFICATE OF COMPLETION"
    title_bbox = draw.textbbox((0, 0), title, font=title_font)
    title_width = title_bbox[2] - title_bbox[0]
    title_x = (IMG_SIZE[0] - title_width) // 2
    draw.text((title_x, 60), title, fill='black', font=title_font)
    
    # Draw content
    y_position = 150
    for line in text.split('\n'):
        if line.strip():
            bbox = draw.textbbox((0, 0), line, font=text_font)
            text_width = bbox[2] - bbox[0]
            x = (IMG_SIZE[0] - text_width) // 2
            draw.text((x, y_position), line, fill='black', font=text_font)
            y_position += 40
    
    # Add noise if requested
    if add_noise:
        pixels = img.load()
        for _ in range(1000):
            x = random.randint(0, IMG_SIZE[0]-1)
            y = random.randint(0, IMG_SIZE[1]-1)
            noise = random.randint(-30, 30)
            r, g, b = pixels[x, y]
            pixels[x, y] = (
                max(0, min(255, r + noise)),
                max(0, min(255, g + noise)),
                max(0, min(255, b + noise))
            )
    
    # Add compression artifacts if requested
    if add_artifacts:
        # Save and reload with low quality
        temp_path = 'temp_artifact.jpg'
        img.save(temp_path, quality=30)
        img = Image.open(temp_path)
        os.remove(temp_path)
    
    # Adjust quality
    if quality == 'low':
        img = img.resize((400, 300))
        img = img.resize(IMG_SIZE)
    
    return img

def generate_authentic_certificates(count):
    """Generate authentic certificate samples"""
    print(f"Generating {count} authentic certificates...")
    
    names = ["John Doe", "Jane Smith", "Alice Johnson", "Bob Williams", "Carol Brown"]
    courses = ["Web Development", "Data Science", "Machine Learning", "Cloud Computing", "Cybersecurity"]
    institutions = ["Tech University", "Digital Academy", "Innovation Institute", "Learning Center", "Education Hub"]
    
    for i in range(count):
        name = random.choice(names)
        course = random.choice(courses)
        institution = random.choice(institutions)
        cert_id = f"CERT-2024-{i+1:04d}"
        
        text = f"""
This certifies that

{name}

has successfully completed

{course}

at {institution}

Certificate ID: {cert_id}
Date: January 15, 2024
"""
        
        img = generate_certificate_image(text, quality='high')
        img.save(OUTPUT_DIR / 'authentic' / f'cert_{i+1:04d}.jpg', quality=95)
    
    print(f"✅ Generated {count} authentic certificates")

def generate_forged_certificates(count):
    """Generate forged certificate samples"""
    print(f"Generating {count} forged certificates...")
    
    for i in range(count):
        text = f"""
This certifies that

Fake Person {i+1}

has successfully completed

Fake Course

at Fake Institution

Certificate ID: FAKE-{i+1:04d}
Date: Invalid Date
"""
        
        # Forged certificates have inconsistencies
        img = generate_certificate_image(text, quality='high', add_noise=True)
        img.save(OUTPUT_DIR / 'forged' / f'fake_{i+1:04d}.jpg', quality=85)
    
    print(f"✅ Generated {count} forged certificates")

def generate_tampered_certificates(count):
    """Generate tampered certificate samples"""
    print(f"Generating {count} tampered certificates...")
    
    for i in range(count):
        text = f"""
This certifies that

Modified Name {i+1}

has successfully completed

Edited Course

at Changed Institution

Certificate ID: EDIT-{i+1:04d}
Date: January 15, 2024
"""
        
        # Tampered certificates have compression artifacts
        img = generate_certificate_image(text, quality='high', add_artifacts=True)
        img.save(OUTPUT_DIR / 'tampered' / f'edited_{i+1:04d}.jpg', quality=70)
    
    print(f"✅ Generated {count} tampered certificates")

def generate_screenshot_certificates(count):
    """Generate screenshot certificate samples"""
    print(f"Generating {count} screenshot certificates...")
    
    for i in range(count):
        text = f"""
This certifies that

Screenshot User {i+1}

has successfully completed

Screenshot Course

at Screenshot Institution

Certificate ID: SCREEN-{i+1:04d}
Date: January 15, 2024
"""
        
        # Screenshots have low quality
        img = generate_certificate_image(text, quality='low', add_noise=True)
        img.save(OUTPUT_DIR / 'screenshot' / f'screen_{i+1:04d}.jpg', quality=60)
    
    print(f"✅ Generated {count} screenshot certificates")

def main():
    """Generate all sample data"""
    print("=" * 60)
    print("Generating Sample Training Data")
    print("=" * 60)
    print(f"\nThis will create {SAMPLES_PER_CLASS} samples per class")
    print(f"Total: {SAMPLES_PER_CLASS * 4} images\n")
    
    # Create directories
    create_directories()
    
    # Generate samples
    generate_authentic_certificates(SAMPLES_PER_CLASS)
    generate_forged_certificates(SAMPLES_PER_CLASS)
    generate_tampered_certificates(SAMPLES_PER_CLASS)
    generate_screenshot_certificates(SAMPLES_PER_CLASS)
    
    print("\n" + "=" * 60)
    print("✅ Sample data generation complete!")
    print("=" * 60)
    print(f"\nGenerated files in: {OUTPUT_DIR}")
    print("\nNext steps:")
    print("1. Review the generated images")
    print("2. Replace with real certificate images for better accuracy")
    print("3. Run: python train_model.py")

if __name__ == '__main__':
    main()
