// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract HealthcareRecords{
  address owner;

  struct Record{
    uint256 recordID;
    string patientName;
    string diagnosis;
    string treatment;
    uint256 timestamp;
  }

  mapping(uint256 => Record[]) private patientRecords;

  mapping(address => bool) private authorizedProviders;

  modifier onlyOwner(){
    require(msg.sender == owner,"Only owner can perform this function");
    _;
  }

  modifier onlyAuthorizedProvider(){
    require(authorizedProviders[msg.sender],"Only authorized provider can perform this function");
    _;
  }

  constructor(){
    owner = msg.sender;
  }

  function getOwner() public view returns(address){
    return owner;
  }

  function authorizedProvider(address _provider) public onlyOwner{
    authorizedProviders[_provider] = true;
  }

  function addRecord(uint256 _patientId, string memory patientName, string memory diagnosis, string memory treatment) public onlyAuthorizedProvider{
    uint256 recordID = patientRecords[_patientId].length + 1;
    patientRecords[_patientId].push(Record(recordID, patientName, diagnosis, treatment, block.timestamp));
  }

  function getPatientRecords(uint256 _patientId) public view onlyAuthorizedProvider returns(Record[] memory){
    return patientRecords[_patientId];
  }
}