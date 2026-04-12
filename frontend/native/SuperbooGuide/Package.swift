// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "SuperbooGuide",
    platforms: [.macOS(.v14)],
    targets: [
        .executableTarget(
            name: "SuperbooGuide",
            path: "Sources"
        )
    ]
)
