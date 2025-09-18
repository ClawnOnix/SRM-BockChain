// JOSE JAVIER SANTANA 1107556
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract PrescriptionRegistry {
    struct Prescription {
        bytes32 contentHash;   // Hash de la receta (keccak256)
        bytes signature;       // Firma digital del médico
        uint256 issuedAt;      // Timestamp de emisión
    }

    mapping(bytes32 => Prescription) private prescriptions;

    event PrescriptionIssued(
        bytes32 indexed prescriptionId,
        bytes32 contentHash,
        address indexed doctor,
        uint256 issuedAt
    );

    function registerPrescription(
        bytes32 prescriptionId,
        bytes32 contentHash,
        bytes calldata signature
    ) external {
        require(prescriptions[prescriptionId].issuedAt == 0, "Ya existe");
        prescriptions[prescriptionId] = Prescription({
            contentHash: contentHash,
            signature: signature,
            issuedAt: block.timestamp
        });
        emit PrescriptionIssued(prescriptionId, contentHash, msg.sender, block.timestamp);
    }

    function getPrescription(bytes32 prescriptionId)
        external
        view
        returns (bytes32 contentHash, bytes memory signature, uint256 issuedAt, address doctor)
    {
        Prescription storage p = prescriptions[prescriptionId];
        require(p.issuedAt != 0, "No encontrada");
        return (p.contentHash, p.signature, p.issuedAt, tx.origin);
    }
}
