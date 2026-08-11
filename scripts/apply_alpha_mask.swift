import AppKit
import CoreGraphics
import Foundation
import ImageIO
import UniformTypeIdentifiers

struct RGBAImage {
    let width: Int
    let height: Int
    var data: [UInt8]
}

enum ImageError: Error {
    case loadFailed(String)
    case cgImageFailed(String)
    case contextFailed
    case writeFailed(String)
    case sizeMismatch
}

func loadRGBA(_ path: String) throws -> RGBAImage {
    guard let image = NSImage(contentsOfFile: path) else {
        throw ImageError.loadFailed(path)
    }

    guard let cgImage = image.cgImage(forProposedRect: nil, context: nil, hints: nil) else {
        throw ImageError.cgImageFailed(path)
    }

    let width = cgImage.width
    let height = cgImage.height
    var data = [UInt8](repeating: 0, count: width * height * 4)
    let colorSpace = CGColorSpaceCreateDeviceRGB()

    guard let context = CGContext(
        data: &data,
        width: width,
        height: height,
        bitsPerComponent: 8,
        bytesPerRow: width * 4,
        space: colorSpace,
        bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue
    ) else {
        throw ImageError.contextFailed
    }

    context.clear(CGRect(x: 0, y: 0, width: width, height: height))
    context.draw(cgImage, in: CGRect(x: 0, y: 0, width: width, height: height))

    return RGBAImage(width: width, height: height, data: data)
}

func savePNG(_ image: RGBAImage, to path: String) throws {
    var data = image.data
    let colorSpace = CGColorSpaceCreateDeviceRGB()

    guard let provider = CGDataProvider(data: NSData(bytes: &data, length: data.count)) else {
        throw ImageError.contextFailed
    }

    guard let cgImage = CGImage(
        width: image.width,
        height: image.height,
        bitsPerComponent: 8,
        bitsPerPixel: 32,
        bytesPerRow: image.width * 4,
        space: colorSpace,
        bitmapInfo: CGBitmapInfo(rawValue: CGImageAlphaInfo.premultipliedLast.rawValue),
        provider: provider,
        decode: nil,
        shouldInterpolate: true,
        intent: .defaultIntent
    ) else {
        throw ImageError.contextFailed
    }

    let url = URL(fileURLWithPath: path)
    guard let destination = CGImageDestinationCreateWithURL(url as CFURL, UTType.png.identifier as CFString, 1, nil) else {
        throw ImageError.writeFailed(path)
    }

    CGImageDestinationAddImage(destination, cgImage, nil)

    if !CGImageDestinationFinalize(destination) {
        throw ImageError.writeFailed(path)
    }
}

let baseDir = CommandLine.arguments[1]
let maskDir = CommandLine.arguments[2]
let outDir = CommandLine.arguments[3]
let fileManager = FileManager.default

try fileManager.createDirectory(atPath: outDir, withIntermediateDirectories: true)

for index in 1...8 {
    let number = String(format: "%02d", index)
    let sourceName = "cat_singing_bowl_hit_\(number).png"
    let basePath = "\(baseDir)/\(sourceName)"
    let maskPath = "\(maskDir)/\(sourceName)"
    let outPath = "\(outDir)/hit_\(number).png"

    let base = try loadRGBA(basePath)
    let mask = try loadRGBA(maskPath)

    guard base.width == mask.width && base.height == mask.height else {
        throw ImageError.sizeMismatch
    }

    var output = base

    for pixel in 0..<(base.width * base.height) {
        let offset = pixel * 4
        let baseAlpha = base.data[offset + 3]
        let maskAlpha = mask.data[offset + 3]

        if maskAlpha < 8 {
            output.data[offset] = 0
            output.data[offset + 1] = 0
            output.data[offset + 2] = 0
            output.data[offset + 3] = 0
        } else {
            output.data[offset + 3] = min(baseAlpha, maskAlpha)
        }
    }

    try savePNG(output, to: outPath)
    print("wrote \(outPath)")
}
